import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export default NextAuth({
  secret: process.env.SECRET,
  providers: [
    CredentialsProvider({
      id: "credentials",
      async authorize(credentials) {
        try {
          const response = await axios.post(
            "https://double-up-test.myshopify.com/api/2023-04/graphql.json",
            {
              query: `
                mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
                  customerAccessTokenCreate(input: $input) {
                    customerAccessToken {
                      accessToken
                      expiresAt
                    }
                    customerUserErrors {
                      code
                      field
                      message
                    }
                  }
                }
              `,
              variables: {
                input: {
                  email: credentials.email,
                  password: credentials.password,
                },
              },
            },
            {
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Storefront-Access-Token":
                  process.env.SHOPIFY_STOREFRONT_API_TOKEN,
              },
            }
          );

          const customerAccessTokenCreate = response.data.data.customerAccessTokenCreate;

          if (customerAccessTokenCreate.customerUserErrors.length > 0) {
            throw new Error(
              customerAccessTokenCreate.customerUserErrors[0].message
            );
          }

          return {
            id: customerAccessTokenCreate.customerAccessToken.accessToken,
            expiration: customerAccessTokenCreate.customerAccessToken.expiresAt,
          };
        } catch (error) {
          console.error(error);
          throw new Error("Authentication failed.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.providerAccountId
      }
      return token
    },
    async session({ session, token, user }) {
      if(token) {
        session.accessToken = token.accessToken
      }
      return session
    }
  },
});
