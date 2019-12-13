package club.acmm.gdoi.registration.config

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.servlet.ModelAndView
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter
import org.springframework.web.servlet.resource.DefaultServletHttpRequestHandler
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Component
class VoidResponseHandlerInterceptor : HandlerInterceptorAdapter() {

    override fun postHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any, modelAndView: ModelAndView?) {
        if (!response.isCommitted) {
            if (modelAndView != null)
                return

            if (handler.javaClass == DefaultServletHttpRequestHandler::class.java)
                return

            response.status = HttpStatus.OK.value()
            response.characterEncoding = "UTF-8"
            response.contentType = "application/json"
            response.writer.use { it.write("{ \"success\": true }") }
            response.flushBuffer()
        }
    }
}