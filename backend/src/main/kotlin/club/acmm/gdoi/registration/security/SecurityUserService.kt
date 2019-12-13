package club.acmm.gdoi.registration.security

import club.acmm.gdoi.registration.model.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.rest.webmvc.ResourceNotFoundException
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class SecurityUserService @Autowired constructor(
        val userRepository: UserRepository
) : UserDetailsService {

    @Throws(UsernameNotFoundException::class)
    override fun loadUserByUsername(principal: String): UserDetails {
        if (principal.isBlank())
            throw IllegalArgumentException("Principal $principal is not correct")

        val user = userRepository.findByUsername(principal)
        return UserPrincipal.create(user ?: throw UsernameNotFoundException("User not found"))
    }

    fun loadUserById(id: Long): UserDetails {
        val user = userRepository.findById(id)
                .orElseThrow { ResourceNotFoundException() }

        return UserPrincipal.create(user)
    }
}