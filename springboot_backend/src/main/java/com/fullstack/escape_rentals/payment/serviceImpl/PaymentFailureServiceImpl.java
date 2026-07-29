package com.fullstack.escape_rentals.payment.serviceImpl;

import com.fullstack.escape_rentals.payment.entity.PaymentEntity;
import com.fullstack.escape_rentals.payment.entity.PaymentStatus;
import com.fullstack.escape_rentals.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentFailureServiceImpl {

    private final PaymentRepository paymentRepository;

    @Transactional(
            propagation = Propagation.REQUIRES_NEW
    )
    public void markFailed(
            PaymentEntity payment
    ){
        payment.setStatus(
                PaymentStatus.FAILED
        );
        paymentRepository.save(payment);
    }
}
