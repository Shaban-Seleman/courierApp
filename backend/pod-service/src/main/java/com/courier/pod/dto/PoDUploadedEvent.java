package com.courier.pod.dto;

import java.time.Instant;
import java.util.UUID;

public record PoDUploadedEvent(UUID orderId, String photoUrl, String signatureUrl, Instant uploadedAt) {
}
