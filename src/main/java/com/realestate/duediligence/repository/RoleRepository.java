package com.realestate.duediligence.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.Role;
import com.realestate.duediligence.enums.RoleType;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByRoleName(RoleType roleName);

}
