package club.acmm.gdoi.registration

import java.util.*
import kotlin.math.pow
import kotlin.math.sqrt

/**
 * Unwrap [Optional] to Kotlin nullable type for using elvis operator.
 */
fun <T> Optional<T>.orNull(): T? = orElse(null)

fun Iterable<Int>.stddev(): Double {
    var stddev = 0.0
    val mean = average()
    for (num in this) {
        stddev += (num - mean).pow(2.0)
    }
    return sqrt(stddev / 10)
}
