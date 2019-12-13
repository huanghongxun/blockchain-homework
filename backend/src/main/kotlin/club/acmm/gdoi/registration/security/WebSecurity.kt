package club.acmm.gdoi.registration.security

import club.acmm.gdoi.registration.model.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class WebSecurity @Autowired constructor(
        val userService: SecurityUserService,
        val userRepository: UserRepository
) {

    fun isAdmin(auth: Authentication): Boolean {
        val userPrincipal = auth.principal as UserPrincipal
        return userPrincipal.admin
    }

    @Transactional
    fun checkUserRole(
            auth: Authentication,
            requestedRole: String): Boolean {
        val userPrincipal = auth.principal as UserPrincipal
        if (userPrincipal.admin) return true

        return userPrincipal.authorities.any { it.authority == requestedRole }
    }
}