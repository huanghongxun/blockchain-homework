package club.acmm.gdoi.registration.model.audit

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.io.Serializable
import java.util.*
import javax.persistence.*

@MappedSuperclass
@EntityListeners(AuditingEntityListener::class)
@JsonIgnoreProperties(value = ["createdAt", "updatedAt"], allowGetters = true)
abstract class DateAudit(
        @CreatedDate
        @Temporal(TemporalType.TIMESTAMP)
        @Column(nullable = false)
        var createdAt: Date = Date(),

        @LastModifiedDate
        @Temporal(TemporalType.TIMESTAMP)
        @Column(nullable = false)
        var updatedAt: Date = Date()
) : Serializable