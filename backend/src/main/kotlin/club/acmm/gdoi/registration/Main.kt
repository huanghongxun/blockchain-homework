package club.acmm.gdoi.registration

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication
import org.springframework.transaction.annotation.EnableTransactionManagement

@SpringBootApplication(scanBasePackages = [
    "club.acmm.gdoi.registration",
    "club.acmm.gdoi.registration.config"
])
@EnableConfigurationProperties
@EnableTransactionManagement
class Registration

fun main(args: Array<String>) {
    runApplication<Registration>(*args)
}