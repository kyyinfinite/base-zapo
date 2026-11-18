const msg1 = {
    messageContextInfo: {
        threadId: [

        ],
        deviceListMetadata: {
            senderKeyIndexes: [

            ],
            recipientKeyIndexes: [

            ],
            senderKeyHash: Buffer.from("9TBAcAmuUReEvA==", "base64"),
            senderTimestamp: 1788160401,
            recipientKeyHash: Buffer.from("WaVIiNrFdNvFtQ==", "base64"),
            recipientTimestamp: 1788139080
        },
        deviceListMetadataVersion: 2,
        messageSecret: Buffer.from("U7BGnObxdFFw8xsuXmKJZl4eavk9PjvtLb5UUD3ikEA=", "base64"),
        botMetadata: {
            verificationMetadata: {
                proofs: [
                    {
                        certificateChain: [
                            Buffer.from("MIICpzCCAk6gAwIBAgIUF0QNLm2M5G62FfTOY4le6N9vi4IwCgYIKoZIzj0EAwIweTEiMCAGA1UEAwwZTWV0YSBXQSBTUyBJbnQgQ0EgMjAyNS0wOTELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExEzARBgNVBAcMCk1lbmxvIFBhcmsxHDAaBgNVBAoME01ldGEgUGxhdGZvcm1zIEluYy4wHhcNMjYwODI5MTgzMTUxWhcNMjcwMzE3MTgzMjAxWjAeMRwwGgYDVQQDDBNzdmM6d2EtYm90LW1zZy1sZWFmMCowBQYDK2VwAyEANaSgR3hZ7Nr2YhrlUA51KE2Ndgn280yVXfZr22LlLQ2jggE8MIIBODALBgNVHQ8EBAMCB4AwHQYDVR0OBBYEFNbDxuZVKG2DVIKm+MXjC4+wmi/9MIG0BgNVHSMEgawwgamAFO81YRGUWbuc0xuufO+lFiYAOjGOoXukeTB3MSAwHgYDVQQDDBdNZXRhIFdBIEZlYXR1cmUgUm9vdCBDQTELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExEzARBgNVBAcMCk1lbmxvIFBhcmsxHDAaBgNVBAoME01ldGEgUGxhdGZvcm1zIEluYy6CFEZvL5Zv8AJ8duOmVC+Foy7F4yg7MFMGCysGAQQBgsAVAgIQBEQMQlVSSTptcmw6Ly9jZXJ0aWZpY2F0ZV9zZXJ2aWNlLndoYXRzYXBwX3NpbXBsZV9zaWduYWwvU2VyaWFsTnVtYmVyczAKBggqhkjOPQQDAgNHADBEAiBg+vUht7+cGeulQqb2brUUROSvVnLaxd20/7Zq5H5TZgIgP+azoCLHPSzRmxNlg/ouB047tSf0b+T7PTsGeNbZ8Dw=", "base64"),
                            Buffer.from("MIIDeDCCAx2gAwIBAgIURm8vlm/wAnx246ZUL4WjLsXjKDswCgYIKoZIzj0EAwIwdzEgMB4GA1UEAwwXTWV0YSBXQSBGZWF0dXJlIFJvb3QgQ0ExCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlhMRMwEQYDVQQHDApNZW5sbyBQYXJrMRwwGgYDVQQKDBNNZXRhIFBsYXRmb3JtcyBJbmMuMB4XDTI1MDkwNDE4MDU0OVoXDTI3MDkwNDE4MDU0OVoweTEiMCAGA1UEAwwZTWV0YSBXQSBTUyBJbnQgQ0EgMjAyNS0wOTELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExEzARBgNVBAcMCk1lbmxvIFBhcmsxHDAaBgNVBAoME01ldGEgUGxhdGZvcm1zIEluYy4wWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAATs+c+UVhvMBZzu4AHndKKTZASPLp2vUt1g84aUpdOFqmqCs5KEJ8Sxhi8F9GX4P7rPLjfOwfFJRA6yrp+2cX0zo4IBgzCCAX8wHQYDVR0OBBYEFO81YRGUWbuc0xuufO+lFiYAOjGOMIG0BgNVHSMEgawwgamAFNO7KMTVSYUxkL6VS3LyWJw7m76zoXukeTB3MSAwHgYDVQQDDBdNZXRhIFdBIEZlYXR1cmUgUm9vdCBDQTELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExEzARBgNVBAcMCk1lbmxvIFBhcmsxHDAaBgNVBAoME01ldGEgUGxhdGZvcm1zIEluYy6CFALbuULsZlYXxk/Cz5I35uNJkpdAMA4GA1UdDwEB/wQEAwIBhjASBgNVHRMBAf8ECDAGAQH/AgEAMEUGA1UdHwQ+MDwwOqA4oDaGNGh0dHBzOi8vbWV0YS5wdWJsaWNrZXlpbmZyYS5jb20vYXJsL3doYXRzYXBwX2ZlYXR1cmUwIAYIKwYBBQUHAQEEFDASMBAGCCsGAQUFBzABhgROb25lMBoGCWCGSAGG+EIBDQQNFgtPbmNhbGw6IHBraTAKBggqhkjOPQQDAgNJADBGAiEAq7Ycf2W/cSA2Ni3L0sgYmPmlRxkPcMgOm+ZRgkiQsdwCIQD2XRUvySFSRYJSfyQW2m4ka8N9gJ8KRMD1KTwyXghXHQ==", "base64")
                        ],
                        version: 1,
                        useCase: 1,
                        signature: Buffer.from("2yr8TcukmjZwMC+sOhendJ9l+4yU/fG1VxekRKEaKQ9KD1O9KM1+hO7qQiI2aAst4Pqj/Q0ZDUDxVUQmJWhDBg==", "base64")
                    }
                ]
            }
        }
    },
    botForwardedMessage: {
        message: {
            richResponseMessage: {
                submessages: [
                    {
                        messageType: 2,
                        messageText: "​"
                    }
                ],
                messageType: 1,
                unifiedResponse: {
                    data: Buffer.from("eyJyZXNwb25zZV9pZCI6ImRjOGEyNTNiLWMxYWQtNDdiYy1iYjE0LTM2NzA0ODlmNDE4YyIsInNlY3Rpb25zIjpbeyJ2aWV3X21vZGVsIjp7InByaW1pdGl2ZSI6eyJ0ZXh0IjoiXHUyMDBiIiwiX190eXBlbmFtZSI6IkdlbkFJTWFya2Rvd25UZXh0VVhQcmltaXRpdmUifSwiX190eXBlbmFtZSI6IkdlbkFJU2luZ2xlTGF5b3V0Vmlld01vZGVsIn19XX0=", "base64")
                },
                contextInfo: {
                    mentionedJid: [

                    ],
                    groupMentions: [

                    ],
                    statusAttributions: [

                    ],
                    forwardingScore: 1,
                    isForwarded: true,
                    expiration: 7776000,
                    ephemeralSettingTimestamp: 1773527159,
                    disappearingMode: {
                        initiator: 1,
                        trigger: 2,
                        initiatedByMe: true
                    },
                    forwardedAiBotMessageInfo: {
                        botJid: "867051314767696@bot"
                    },
                    forwardOrigin: 4
                }
            }
        }
    }
}
const handler = async (m, ctx) => {
    const { conn, chat } = ctx

    const r1 = await conn.message.send(chat, msg1, {
        additionalAttributes: {
            type: "text"
        }
    }
    )

await conn.message.send(chat, {
        botForwardedMessage: {
            message: {
                protocolMessage: {
                    key: {
                        remoteJid: chat,
                        fromMe: true,
                        id: r1.id
                    },
                    type: 14,
                    editedMessage: {
                        botForwardedMessage: {
                            message: {
                                richResponseMessage: {
                                    submessages: [

                                    ],
                                    messageType: 1,
                                    unifiedResponse: {
                                        data: Buffer.from("eyJyZXNwb25zZV9pZCI6ImQ4NzM3NjAxLTNmMGQtNGRiZi04MDUxLTQ1Y2UxNGRhMGRjNSIsInNlY3Rpb25zIjpbeyJ2aWV3X21vZGVsIjp7InByaW1pdGl2ZSI6eyJ0ZXh0IjoiaW5pIHRhYmVsIHJla29tZW5kYXNpIGZpbG0gMyBrb2xvbSB4IDMgYmFyaXM6IiwiX190eXBlbmFtZSI6IkdlbkFJTWFya2Rvd25UZXh0VVhQcmltaXRpdmUifSwiX190eXBlbmFtZSI6IkdlbkFJU2luZ2xlTGF5b3V0Vmlld01vZGVsIn19LHsidmlld19tb2RlbCI6eyJwcmltaXRpdmUiOnsicm93cyI6W3siaXNfaGVhZGVyIjp0cnVlLCJjZWxscyI6WyIqKkp1ZHVsIEZpbG0qKiIsIioqR2VucmUqKiIsIioqUmF0aW5nKioiXSwibWFya2Rvd25fY2VsbHMiOlt7InRleHQiOiIqSnVkdWwgRmlsbSoifSx7InRleHQiOiIqR2VucmUqIn0seyJ0ZXh0IjoiKlJhdGluZyoifV19LHsiaXNfaGVhZGVyIjpmYWxzZSwiY2VsbHMiOlsiSW50ZXJzdGVsbGFyIiwiU2NpLUZpIiwiOS4wLzEwIl0sIm1hcmtkb3duX2NlbGxzIjpbeyJ0ZXh0IjoiSW50ZXJzdGVsbGFyIn0seyJ0ZXh0IjoiU2NpLUZpIn0seyJ0ZXh0IjoiOS4wLzEwIn1dfSx7ImlzX2hlYWRlciI6ZmFsc2UsImNlbGxzIjpbIkluY2VwdGlvbiIsIlRocmlsbGVyIiwiOC44LzEwIl0sIm1hcmtkb3duX2NlbGxzIjpbeyJ0ZXh0IjoiSW5jZXB0aW9uIn0seyJ0ZXh0IjoiVGhyaWxsZXIifSx7InRleHQiOiI4LjgvMTAifV19LHsiaXNfaGVhZGVyIjpmYWxzZSwiY2VsbHMiOlsiVGhlIE1hcnRpYW4iLCJBZHZlbnR1cmUiLCI4LjUvMTAiXSwibWFya2Rvd25fY2VsbHMiOlt7InRleHQiOiJUaGUgTWFydGlhbiJ9LHsidGV4dCI6IkFkdmVudHVyZSJ9LHsidGV4dCI6IjguNS8xMCJ9XX1dLCJfX3R5cGVuYW1lIjoiR2VuQVRhYmxlVVhQcmltaXRpdmUifSwiX190eXBlbmFtZSI6IkdlbkFJU2luZ2xlTGF5b3V0Vmlld01vZGVsIn19LHsidmlld19tb2RlbCI6eyJwcmltaXRpdmUiOnsidGV4dCI6IlRhYmVsIGluaSBiZXJpc2kgYmViZXJhcGEgZmlsbSBkZW5nYW4gZ2VucmUgZGFuIHJhdGluZyBtYXNpbmctbWFzaW5nLiIsIl9fdHlwZW5hbWUiOiJHZW5BSU1hcmtkb3duVGV4dFVYUHJpbWl0aXZlIn0sIl9fdHlwZW5hbWUiOiJHZW5BSVNpbmdsZUxheW91dFZpZXdNb2RlbCJ9fV19", "base64")
                                    },
                                    contextInfo: {
                                        forwardingScore: 1,
                                        isForwarded: true,
                                        forwardOrigin: 4,

                                        forwardedAiBotMessageInfo: {
                                            botJid: "0@bot"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, { additionalAttributes: { type: "text" } })
}

handler.command = ['botf']
handler.description = 'botForwarded'
handler.category = 'experimental'

export default handler
