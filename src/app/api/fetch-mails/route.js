import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const accessToken = request.headers.get("accesstoken") ?? undefined;
        const refreshToken = request.headers.get("refreshtoken") ?? undefined;


        if (!accessToken || !refreshToken) {
            return NextResponse.json({
                success: false,
                message: "Missing required tokens"
            }, { status: 401 })
        }

        const listUrl =
            "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5";

        const messageBaseUrl =
            "https://gmail.googleapis.com/gmail/v1/users/me/messages";

        const response = await fetch(`${listUrl}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            }
        })

        const listData = await response.json();
        const messages = listData.messages ?? [];

        // console.log(`\nFound ${messages.length} unread emails:\n`);
        let formattedMessages = [];

        for (const msg of messages) {

            const url = new URL(`${messageBaseUrl}/${msg.id}`);
            url.searchParams.set("format", "metadata");
            url.searchParams.append("metadataHeaders", "From");
            url.searchParams.append("metadataHeaders", "Subject");
            url.searchParams.append("metadataHeaders", "Date");

            const msgResponse = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const msgData = await msgResponse.json();
            const headersList = msgData.payload?.headers ?? [];

            // console.log('headers list, ', JSON.stringify(headersList))

            const getHeader = (name) =>
                headersList.find((h) => h.name === name)?.value ?? null;

            const formattedMessage = {
                id: msg.id,
                threadId: msg.threadId,
                from: getHeader("From") ?? "Unknown",
                subject: getHeader("Subject") ?? "No Subject",
                date: getHeader("Date") ?? "Unknown",
                snippet: msgData.snippet ?? "",
                internalDate: msgData.internalDate
                    ? new Date(Number(msgData.internalDate)).toISOString()
                    : null,
            };

            formattedMessages.push(formattedMessage);
        }


        return NextResponse.json({
            success: true,
            message: "Mails fetched successfully!",
            data: formattedMessages
        }, { status: 201 })

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "Error fetching mails"
        }, { status: 500 })
    }
}