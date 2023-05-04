import { useSession } from "next-auth/react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Orders() {
  const session = useSession();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function fetchOrders() {
      if (session.data && session.status !== "loading") {
        try {
          const response = await axios.post(
            "https://double-up-test.myshopify.com/api/2023-04/graphql.json",
            {
              query: `
                query customerOrders($customerAccessToken: String!) {
                  customer(customerAccessToken: $customerAccessToken) {
                    orders(first: 10) {
                      edges {
                        node {
                          id
                          processedAt
                          totalPriceV2 {
                            amount
                            currencyCode
                          }
                          lineItems(first: 10) {
                            edges {
                              node {
                                title
                                quantity
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              `,
              variables: {
                customerAccessToken: session.data.accessToken,
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
          console.log(response.data.data)
          if (response.data.data && response.data.data.customer) {
            return setOrders(response.data.data.customer.orders.edges.map((edge) => edge.node));
          } else {
            throw new Error(response.data.errors[0].message);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }

    fetchOrders();
  }, [session]);

  if (session.status === "loading") return <p>Loading...</p>;
  if (!session.data) return <p>Please sign in to view your orders.</p>;

  return (
    <div>
      <h1>Your Orders</h1>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            <p>
              Order #{order.id} - {order.processedAt}
            </p>
            <p>
              Total: {order.totalPriceV2.amount} {order.totalPriceV2.currencyCode}
            </p>
            <ul>
              {order.lineItems.edges.map((item) => (
                <li key={item.node.title}>
                  {item.node.title} - {item.node.quantity} pcs
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
