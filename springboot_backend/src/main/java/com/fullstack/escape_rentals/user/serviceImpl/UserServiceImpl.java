package com.fullstack.escape_rentals.user.serviceImpl;

import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.exception.DuplicateResourceException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import com.fullstack.escape_rentals.user.dto.request.DisableAccountRequest;
import com.fullstack.escape_rentals.user.dto.request.UpdateUserRequest;
import com.fullstack.escape_rentals.user.dto.response.UserResponse;
import com.fullstack.escape_rentals.user.entity.Role;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import com.fullstack.escape_rentals.user.mapper.UserMapper;
import com.fullstack.escape_rentals.user.repository.UserRepository;
import com.fullstack.escape_rentals.user.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse getUserById(Long id){
        UserEntity user = userRepository.findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException("User not found")
                );
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request){
        UserEntity user = userRepository.findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException("User not found")
                );
        if(userRepository.existsByPhone(request.getPhone()) && !user.getPhone().equals(request.getPhone())) {
            throw new DuplicateResourceException("Mobile Number already exists!!");
        }

        if(userRepository.existsByEmail(request.getEmail()) && !user.getEmail().equals(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists!!");
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        if(request.getNewPassword() != null && !request.getNewPassword().isBlank()){
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        System.out.println("PASSWORD FROM REQUEST = " + request.getNewPassword());

        return userMapper.toResponse(
                userRepository.save(user)
        );
    }

    @Override
    @Transactional
    public void deleteUserByAdmin(Long id) {
        UserEntity user =  userRepository.findById(id)
                .orElseThrow(
                        () ->  new ResourceNotFoundException("User not found with id: "+id)
        );
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public void deleteOwnAccount() {

        CustomUserDetails userDetails =
                (CustomUserDetails)
                        Objects.requireNonNull(SecurityContextHolder
                                        .getContext()
                                        .getAuthentication())
                                .getPrincipal();


        Long userId = userDetails.getId();

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("User not found")
                );

        if(user.getRole() == Role.ROLE_ADMIN){
            throw new BadRequestException(
                    "Cannot delete admin account"
            );
        }
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public void disableUser(
            Long id,
            DisableAccountRequest request
    ){

        UserEntity user =
                userRepository.findById(id)
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "User not found"
                                )
                        );

        if(user.getRole() == Role.ROLE_ADMIN){
            throw new BadRequestException(
                    "Cannot disable admin account"
            );
        }

        if(request.getDuration() == null){
            throw new BadRequestException(
                    "Disable duration is required"
            );
        }

        LocalDateTime until = switch(request.getDuration()){
            case WEEK -> LocalDateTime.now().plusWeeks(1);

            case MONTH -> LocalDateTime.now().plusMonths(1);

            case YEAR -> LocalDateTime.now().plusYears(1);

            case PERMANENT ->  null;
        };
        user.setEnabled(false);
        user.setDisabledUntil(until);
        userRepository.save(user);
    }


    @Override
    @Transactional
    public void enableUser(Long id){
        UserEntity user =
                userRepository.findById(id)
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "User not found"
                                )
                        );
        user.setEnabled(true);
        user.setDisabledUntil(null);
        userRepository.save(user);

    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable){
        return userRepository.findAll(pageable)
                .map(userMapper::toResponse);
    }

}


















