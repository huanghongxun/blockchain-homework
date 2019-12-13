package club.acmm.gdoi.registration.model

import club.acmm.gdoi.registration.model.audit.DateAudit
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import javax.persistence.*

@Entity
data class GovernmentCompany(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long? = null,

        @ManyToOne
        val government: User,

        @ManyToOne
        val company: User
) : DateAudit() {
    override fun equals(other: Any?): Boolean {
        if (other == null || other !is GovernmentCompany) return false
        return id == other.id
    }

    override fun hashCode(): Int {
        return id?.toInt() ?: super.hashCode()
    }
}

@Repository
interface GovernmentCompanyRepository : JpaRepository<GovernmentCompany, Long> {
    @Query("SELECT gc.company FROM GovernmentCompany gc WHERE gc.government.id = :governmentId AND gc.company.status = :status")
    fun findAllCompaniesByGovernmentAndStatus(governmentId: Long, status: UserStatus): List<User>
}
