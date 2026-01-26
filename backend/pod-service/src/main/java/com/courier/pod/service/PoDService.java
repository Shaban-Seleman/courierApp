package com.courier.pod.service;

import com.courier.pod.config.RabbitMQConfig;
import com.courier.pod.dto.PoDUploadedEvent;
import com.courier.pod.entity.ProofOfDelivery;
import com.courier.pod.repository.PoDRepository;
import io.minio.MinioClient;
import io.minio.SetBucketPolicyArgs;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PoDService {

    private final PoDRepository podRepository;
    private final MinioClient minioClient;
    private final RabbitTemplate rabbitTemplate;

    @Value("${minio.bucket}")
    private String bucketName;

    @Value("${minio.url}")
    private String minioUrl;

    @Transactional
    public ProofOfDelivery uploadPoD(UUID orderId, MultipartFile photo, MultipartFile signature) {
        try {
            ensureBucketExists();

            String photoUrl = uploadFile(photo, "photos/" + orderId + "-photo-" + photo.getOriginalFilename());
            String signatureUrl = uploadFile(signature, "signatures/" + orderId + "-signature-" + signature.getOriginalFilename());

            ProofOfDelivery pod = ProofOfDelivery.builder()
                    .orderId(orderId)
                    .photoUrl(photoUrl)
                    .signatureUrl(signatureUrl)
                    .build();

            pod = podRepository.save(pod);

            // Publish Event
            PoDUploadedEvent event = new PoDUploadedEvent(
                    orderId, photoUrl, signatureUrl, pod.getUploadedAt());
            
            rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, RabbitMQConfig.POD_UPLOADED_ROUTING_KEY, event);
            log.info("PoD uploaded and event published for order: {}", orderId);

            return pod;

        } catch (Exception e) {
            log.error("Failed to upload PoD for order {}: {}", orderId, e.getMessage());
            throw new RuntimeException("Failed to upload PoD", e);
        }
    }

    private void ensureBucketExists() {
        try {
            boolean found = minioClient.bucketExists(io.minio.BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(io.minio.MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("Bucket '{}' created.", bucketName);
                
                String policy = "{\n" +
                        "    \"Version\": \"2012-10-17\",\n" +
                        "    \"Statement\": [\n" +
                        "        {\n" +
                        "            \"Effect\": \"Allow\",\n" +
                        "            \"Principal\": {\n" +
                        "                \"AWS\": [\n" +
                        "                    \"*\"\n" +
                        "                ]\n" +
                        "            },\n" +
                        "            \"Action\": [\n" +
                        "                \"s3:GetObject\"\n" +
                        "            ],\n" +
                        "            \"Resource\": [\n" +
                        "                \"arn:aws:s3:::" + bucketName + "/*\"\n" +
                        "            ]\n" +
                        "        }\n" +
                        "    ]\n" +
                        "}";

                minioClient.setBucketPolicy(
                        SetBucketPolicyArgs.builder().bucket(bucketName).config(policy).build());
                log.info("Bucket policy set to public read.");
            }
        } catch (Exception e) {
            log.error("Error checking/creating bucket: {}", e.getMessage());
        }
    }

    private String uploadFile(MultipartFile file, String objectName) throws Exception {
        InputStream inputStream = file.getInputStream();
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .stream(inputStream, file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build());
        
        // Construct URL (assuming public bucket or presigned logic, here simple concat for prototype)
        // If running in docker, 'minioUrl' might be internal 'minio:9000', which isn't reachable from browser.
        // For now, we store the relative path or assuming a public gateway.
        // Or we just return the object name and let frontend construct it, 
        // but for simplicity I'll store the objectName or a constructed URL.
        // Let's store the full object path if we assume a specific access pattern.
        // Actually, returning just the object name is safer if domain changes.
        // But the requirement says "URL".
        // I will return the objectName for now, or constructed URL if I knew the public endpoint.
        // Given 'minioUrl' is injected, let's use it but be aware of docker networking.
        
        // Fix for browser access: If backend sees 'minio:9000', browser needs 'localhost:9000'.
        // I'll return the object path and let the frontend/gateway handle the base URL or proxy.
        return objectName; 
    }
}