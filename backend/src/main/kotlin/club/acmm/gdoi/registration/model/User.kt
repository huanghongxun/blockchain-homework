package club.acmm.gdoi.registration.model

import club.acmm.gdoi.registration.EnumConverter
import club.acmm.gdoi.registration.model.audit.DateAudit
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue
import org.hibernate.annotations.NaturalId
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.jpa.repository.Temporal
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import org.springframework.stereotype.Repository
import java.io.Serializable
import java.util.*
import javax.persistence.*
import javax.validation.constraints.Email
import javax.validation.constraints.NotBlank
import javax.validation.constraints.NotNull
import javax.validation.constraints.Size

enum class UserStatus {
    SUBMITTED,
    ACCEPTED,
    REJECTED
}

@Component
class UserStatusEnumConverter : EnumConverter<UserStatus>(UserStatus::class.java)

enum class Role {
    ROLE_ADMIN,
    ROLE_COMPANY,
    ROLE_BANK,
    ROLE_GOVERNMENT
}

@Component
class RoleEnumConverter : EnumConverter<Role>(Role::class.java)

/**
 * Username can be equal in different contests.
 *
 * Let user re-register a new account for upcoming contest. Since
 * contestants usually forget their account because period during
 * two adjacent contests is too long.
 */
@Entity
data class User(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long? = null,

        @NotBlank
        @Size(max = 40)
        @Column(nullable = false, unique = true, length = 40)
        val username: String,

        /**
         * Chinese name.
         */
        @NotBlank
        @Size(max = 32)
        @Column(length = 32, unique = true, nullable = false)
        val name: String,

        @NotBlank
        @Size(max = 128)
        @Column(nullable = false)
        val password: String,

        @NotNull
        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        val role: Role,

        @NotNull
        @Column(nullable = false, unique = true)
        val publicKey: String,

        @NotNull
        @Column(nullable = false, unique = true)
        val address: String,

        @NotNull
        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        var status: UserStatus

) : DateAudit() {
    override fun equals(other: Any?): Boolean {
        if (other == null || other !is User) return false
        return id == other.id
    }

    override fun hashCode(): Int {
        return id?.toInt() ?: super.hashCode()
    }
}

@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun findByUsername(username: String): User?
    fun findByAddress(address: String): User?

    fun existsByUsername(username: String): Boolean

    fun existsByName(name: String): Boolean
    fun existsByRole(role: Role): Boolean

    fun findByIdIn(userIds: List<Long>): MutableList<User>

    fun findAllByRole(role: Role): List<User>

    @Query("SELECT u FROM User u WHERE u.role IN :role AND u.status IN :status")
    fun findAllByRoleAndStatus(role: Collection<Role>, status: Collection<UserStatus>): List<User>
}
