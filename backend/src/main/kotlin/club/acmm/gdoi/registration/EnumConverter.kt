package club.acmm.gdoi.registration

import org.springframework.core.convert.converter.Converter

interface EnumWithName {
    val shortName: String
}

/**
 * A utility class for converting string to enum constant in classes
 * annotated by [javax.persistence.Entity],
 * [org.springframework.web.bind.annotation.RequestBody],
 * [org.springframework.web.bind.annotation.RequestParam] identified
 * by name of the enum constant ignoring alphabet case.
 *
 * Usage: implement a class for converting [String] to some Enum T,
 * which extends EnumConverter<T>(T::class.java), annotated by
 * [org.springframework.stereotype.Component]
 *
 * Example:
 *
 * ```
 * @Component
 * class SomeEnumConverter : EnumConverter<SomeEnum>(SomeEnum::class.java)
 * ```
 */
abstract class EnumConverter<T>(private val cls: Class<T>) : Converter<String, T>
        where T : Enum<T> {
    override fun convert(source: String): T? {
        return cls.enumConstants
                .firstOrNull { it.name.equals(source, ignoreCase = true) }
    }
}

/**
 * A utility class for converting string to enum constant in classes
 * annotated by [javax.persistence.Entity],
 * [org.springframework.web.bind.annotation.RequestBody],
 * [org.springframework.web.bind.annotation.RequestParam] identified
 * by specified name(by implementing interface [EnumWithName.shortName]
 * of the enum constant ignoring alphabet case.
 *
 * Usage: implement a class for converting [String] to some Enum T,
 * which extends EnumConverter<T>(T::class.java), annotated by
 * [org.springframework.stereotype.Component]
 *
 * Example:
 *
 * ```
 * enum class SomeEnum(override val shortName: String) : EnumWithName
 *
 * @Component
 * class SomeEnumConverter : EnumBaseConverter<SomeEnum>(SomeEnum::class.java)
 * ```
 */
abstract class EnumBaseConverter<T>(private val cls: Class<T>) : Converter<String, T>
        where T : Enum<T>, T : EnumWithName {
    override fun convert(source: String): T? {
        return cls.enumConstants
                .firstOrNull { (it as EnumWithName).shortName.equals(source, ignoreCase = true) }
    }
}