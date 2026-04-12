using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Templates
{
    public class WelcomeTamplate
    {
        public static string GetTemplate()
        {
            return $"""
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <title>Welcome to MyApp</title>
                </head>
                <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                          <!-- Header -->
                          <tr>
                            <td style="background:linear-gradient(135deg,#10b981,#059669);padding:40px;text-align:center;">
                              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                                🎉 Welcome to MyApp!
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
                                We're thrilled to have you on board. Your account is all set and ready to go!
                              </p>

                              <!-- Feature Cards -->
                              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                                <tr>
                                  <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;width:30%;vertical-align:top;">
                                    <p style="margin:0 0 8px;font-size:22px;">🚀</p>
                                    <p style="margin:0;color:#065f46;font-size:14px;font-weight:600;">Get Started</p>
                                    <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Set up your profile and explore the dashboard.</p>
                                  </td>
                                  <td style="width:16px;"></td>
                                  <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;width:30%;vertical-align:top;">
                                    <p style="margin:0 0 8px;font-size:22px;">📚</p>
                                    <p style="margin:0;color:#065f46;font-size:14px;font-weight:600;">Documentation</p>
                                    <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Browse our guides to get the most out of MyApp.</p>
                                  </td>
                                  <td style="width:16px;"></td>
                                  <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;width:30%;vertical-align:top;">
                                    <p style="margin:0 0 8px;font-size:22px;">💬</p>
                                    <p style="margin:0;color:#065f46;font-size:14px;font-weight:600;">Support</p>
                                    <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Our team is here to help you anytime.</p>
                                  </td>
                                </tr>
                              </table>

                              <!-- CTA Button -->
                              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                                <tr>
                                  <td style="background:linear-gradient(135deg,#10b981,#059669);border-radius:8px;padding:14px 32px;text-align:center;">
                                    <a href="https://myapp.com/dashboard"
                                       style="color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;display:block;">
                                      Go to Dashboard →
                                    </a>
                                  </td>
                                </tr>
                              </table>

                              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

                              <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
                                Questions? Reply to this email or contact us at
                                <a href="mailto:support@myapp.com" style="color:#10b981;">support@myapp.com</a>
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
