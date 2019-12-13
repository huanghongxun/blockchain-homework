package club.acmm.gdoi.registration.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

const val PASSWORD_STRENGTH = 4

@Configuration
@ConfigurationProperties("constants")
class Constants {
    lateinit var contractAddress: String
    lateinit var companyTable: String
    lateinit var inReceiptTable: String
    lateinit var outReceiptTable: String
}