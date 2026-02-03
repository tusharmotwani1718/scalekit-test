import { NextResponse } from "next/server";
import { connectedAccounts, tools } from "../../../../conf/scalekit_config";

export async function POST(request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({
                success: false,
                message: "email is missing"
            }, { status: 401 })
        }

        // check connected account:
        const response = await connectedAccounts.getOrCreateConnectedAccount({
            connector: 'gmail',
            identifier: email,
        });

        const connectedAccount = response.connectedAccount;
        console.log('Connected account created:', connectedAccount?.id);

        if (connectedAccount?.status !== 'ACTIVE') {
            console.log('gmail is not connected:', connectedAccount?.status);
            const linkResponse = await connectedAccounts.getMagicLinkForConnectedAccount({
                connector: 'gmail',
                identifier: email,
            });
            console.log('🔗 click on the link to authorize gmail', linkResponse.link);

            return NextResponse.json({
                success: false,
                message: "Account not authorised. Please authorise the account by clicking on the given link",
                data: {
                    link: linkResponse.link
                }
            }, { status: 401 })
        }

        return NextResponse.json({
            success: true,
            message: "Connection created successfully!"
        }, { status: 201 })
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "error creating connection"
        }, { status: 500 })
    }

}