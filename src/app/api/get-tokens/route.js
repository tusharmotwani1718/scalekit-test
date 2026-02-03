
import { NextResponse } from "next/server";
import { connectedAccounts, tools } from "../../../../conf/scalekit_config.js";

export async function GET(request) {
    try {
        const user_id = request.nextUrl.searchParams.get("user_id");
        console.log('user id: ' + user_id)

        const accountResponse = await connectedAccounts.getConnectedAccountByIdentifier({
            connector: 'gmail',
            identifier: user_id,
        });


        console.log(accountResponse);

        const authDetails = accountResponse?.connectedAccount?.authorizationDetails;

        console.log('auth details: ');
        console.log(authDetails);

        const accessToken = (authDetails && authDetails.details?.case === "oauthToken")
            ? authDetails.details.value?.accessToken
            : undefined;
        const refreshToken = (authDetails && authDetails.details?.case === "oauthToken")
            ? authDetails.details.value?.refreshToken
            : undefined;

        if (!accessToken || !refreshToken) {
            return NextResponse.json({
                success: false,
                message: "OAuth completed but tokens not available yet"
            }, { status: 409 });
        }


        return NextResponse.json({
            success: true,
            message: "tokens fetched successfully."
        }, { status: 201, headers: {
            "accessToken": `${accessToken}`,
            "refreshToken": `${refreshToken}`
        } })
    } catch (error) {
        console.log('error fetching tokens...❌❌❌');
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "error fetching tokens."
        }, { status: 500 })
    }
}