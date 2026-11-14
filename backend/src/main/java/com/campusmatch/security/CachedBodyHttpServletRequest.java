package com.campusmatch.security;

import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

/**
 * Replays a request body that a filter had to read in full (to check it against the signed digest) so the
 * controller still receives exactly the bytes that were verified.
 */
final class CachedBodyHttpServletRequest extends HttpServletRequestWrapper {

    private final byte[] body;

    CachedBodyHttpServletRequest(HttpServletRequest request, byte[] body) {
        super(request);
        this.body = body;
    }

    @Override
    public ServletInputStream getInputStream() {
        ByteArrayInputStream in = new ByteArrayInputStream(body);
        return new ServletInputStream() {
            @Override
            public boolean isFinished() {
                return in.available() == 0;
            }

            @Override
            public boolean isReady() {
                return true;
            }

            @Override
            public void setReadListener(ReadListener readListener) {
                throw new IllegalStateException("Asynchronous reads are not supported on a cached body");
            }

            @Override
            public int read() {
                return in.read();
            }

            @Override
            public int read(byte[] target, int offset, int length) {
                return in.read(target, offset, length);
            }
        };
    }

    @Override
    public BufferedReader getReader() {
        return new BufferedReader(new InputStreamReader(getInputStream(), charset()));
    }

    private Charset charset() {
        try {
            String encoding = getCharacterEncoding();
            return encoding == null ? StandardCharsets.UTF_8 : Charset.forName(encoding);
        } catch (IllegalArgumentException e) {
            return StandardCharsets.UTF_8;
        }
    }
}
