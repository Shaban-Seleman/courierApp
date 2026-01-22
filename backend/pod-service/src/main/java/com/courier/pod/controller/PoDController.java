package com.courier.pod.controller;

import com.courier.pod.entity.ProofOfDelivery;
import com.courier.pod.service.PoDService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pod")
@RequiredArgsConstructor
public class PoDController {

    private final PoDService podService;

    @PostMapping(value = "/upload/{orderId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProofOfDelivery> uploadPoD(
            @PathVariable UUID orderId,
            @RequestPart("photo") MultipartFile photo,
            @RequestPart("signature") MultipartFile signature) {
        
        return ResponseEntity.ok(podService.uploadPoD(orderId, photo, signature));
    }
}