package com.courier.pod.service;

import com.courier.pod.entity.ProofOfDelivery;
import com.courier.pod.repository.PoDRepository;
import io.minio.MinioClient;
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

    private final MinioClient minioClient;
    private final PoDRepository podRepository;
    private final RabbitTemplate rabbitTemplate;

    @Value("${minio.bucket}")
    private String bucketName;

    @Transactional
    public void uploadPoD(UUID orderId, MultipartFile photo, MultipartFile signature) {
        try {
            String photoUrl = uploadFile(orderId + "/photo.jpg", photo);
            String signatureUrl = uploadFile(orderId + "/signature.png", signature);

            ProofOfDelivery pod = ProofOfDelivery.builder()
                    .orderId(orderId)
                    .photoUrl(photoUrl)
                    .signatureUrl(signatureUrl)
                    .build();

            podRepository.save(pod);

            // Notify Order Service to update status to DELIVERED
            // Using the same exchange defined in Order Service
            rabbitTemplate.convertAndSend("order.exchange", "order.delivered", orderId);
            log.info("PoD uploaded for order: {}", orderId);

        } catch (Exception e) {
            log.error("Failed to upload PoD", e);
            throw new RuntimeException("PoD upload failed", e);
        }
    }

    private String uploadFile(String objectName, MultipartFile file) throws Exception {
        InputStream inputStream = file.getInputStream();
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .stream(inputStream, file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build()
        );
        return objectName;
    }
}
