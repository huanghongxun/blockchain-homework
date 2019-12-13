package club.acmm.gdoi.registration

import javax.validation.*
import javax.validation.constraints.NotNull
import kotlin.reflect.KClass

@MustBeDocumented
@Constraint(validatedBy = [EnumValidatorImpl::class])
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.FIELD)
@NotNull
@ReportAsSingleViolation
annotation class EnumValidator(
        val enumClass: KClass<out Enum<*>>,
        val message: String = "Value is not valid",
        val groups: Array<KClass<*>> = [],
        val payload: Array<KClass<out Payload>> = []
)

class EnumValidatorImpl : ConstraintValidator<EnumValidator, String> {
    val valueList = arrayListOf<String>()

    /**
     * @param value we have already limit null value by @NotNull on @EnumValidator
     */
    override fun isValid(value: String, context: ConstraintValidatorContext?): Boolean {
        return valueList.contains(value.toUpperCase())
    }

    override fun initialize(constraintAnnotation: EnumValidator) {
        valueList.addAll(constraintAnnotation.enumClass.java.enumConstants
                .map { it.toString().toUpperCase() })
    }
}