package club.acmm.gdoi.registration.security

import club.acmm.gdoi.registration.model.Role
import club.acmm.gdoi.registration.model.User
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.*

class UserPrincipal(
        val id: Long,
        @JvmField val username: String,
        val name: String,
        @JvmField val password: String,
        @JvmField val authorities: Collection<GrantedAuthority>,
        val admin: Boolean
) : UserDetails {
    override fun getAuthorities(): Collection<GrantedAuthority> {
        return authorities
    }

    override fun isEnabled(): Boolean {
        return true;
    }

    override fun getUsername(): String {
        return username
    }

    override fun isCredentialsNonExpired(): Boolean {
        return true
    }

    override fun getPassword(): String {
        return password
    }

    override fun isAccountNonExpired(): Boolean {
        return true
    }

    override fun isAccountNonLocked(): Boolean {
        return true
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || javaClass !== other.javaClass) return false
        return Objects.equals(id, (other as UserPrincipal).id)
    }

    override fun hashCode(): Int {
        return Objects.hash(id)
    }

    companion object {
        @JvmStatic
        fun create(user: User): UserPrincipal {
            val authorities = setOf(SimpleGrantedAuthority(user.role.name))

            return UserPrincipal(
                    id = user.id!!,
                    username = user.username,
                    name = user.name,
                    password = user.password,
                    authorities = authorities,
                    admin = user.role == Role.ROLE_ADMIN
            )
        }
    }

}