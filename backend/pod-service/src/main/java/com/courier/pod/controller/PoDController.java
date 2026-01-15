package com.courier.pod.controller;

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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadPoD(
            @RequestParam("orderId") UUID orderId,
            @RequestParam("photo") MultipartFile photo,
            @RequestParam("signature") MultipartFile signature) {
        
        podService.uploadPoD(orderId, photo, signature);
        return ResponseEntity.ok().build();
    }
}
