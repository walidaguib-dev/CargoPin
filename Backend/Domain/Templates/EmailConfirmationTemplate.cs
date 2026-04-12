using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Templates
{
    public class EmailConfirmationTemplate
    {
        public static string GetTemplate(string token, string userId)
        {
            var encodedToken = Uri.EscapeDataString(token);
            return $"""
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <title>Confirm Your Email</title>
                </head>
                <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                          <!-- Header -->
                          <tr>
                            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px;text-align:center;">
                              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                                ✉️ Confirm Your Email
                              </h1>
                            </td>
                          </tr>

                          <!-- Body -->
                          <tr>
                            <td style="padding:40px;">
                              <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">
                                Hi there 👋,
                              </p>
                              <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
                                Thanks for signing up! Please confirm your email address by clicking the button below.
                                This link will expire in <strong>24 hours</strong>.
                              </p>

                              <!-- CTA Button -->
                              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                                <tr>
                                  <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;padding:14px 32px;text-align:center;">
                                    <a href="http://localhost:5005/api/auth/confirm-email?userId={userId}&token={encodedToken}
                                       style="color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;display:block;">
                                      Confirm Email Address
                                    </a>
                                  </td>
                                </tr>
                              </table>

                              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                                If the button doesn't work, copy and paste this link into your browser:
                              </p>
                              <p style="margin:0 0 24px;word-break:break-all;">
                                <a href="http://localhost:5005/api/auth/confirm-email?userId={userId}&token={encodedToken} style="color:#6366f1;font-size:13px;">{encodedToken}</a>
                              </p>

                              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

                              <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
                                If you didn't create an account, you can safely ignore this email.
                              </p>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
                              <p style="margin:0;color:#9ca3af;font-size:12px;">
                                © {DateTime.UtcNow.Year} MyApp. All rights reserved.
                              </p>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """;
        }
    }
}
