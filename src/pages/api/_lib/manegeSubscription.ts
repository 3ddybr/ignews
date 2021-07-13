import { fauna } from "../../../services/fauna";
import {query as q} from "faunadb";
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
    createAction=false,
){
    const userRef = await fauna.query(
        q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('user_by_stripe_customer_id'),
                customerId
                )
            )
        )
    )

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const subscriptionData ={//pra na salver dados desnecessários passa se apenas oq quer na const
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,

    }
    if (createAction){//criando nova subscription
        await fauna.query (
            q.Create(
                q.Collection('subscriptions'),
                {data: subscriptionData}
            )
        )

    }else{
        await fauna.query(//atualizando a subscription ja criada antes ou existente
            q.Replace(
                q.Select(
                    "ref",
                    q.Get(
                        q.Match(
                            q.Index('subscription_by_id'),
                            subscriptionId,
                        )
                    )
                ),
                {data : subscriptionData}
            )
        )
    }
}
    // console.log(subscriptionId, customerId);

    //Buscar o user no banco do FaunaDB com o ID {customerId}
    //apos tenho que salvar os dados da subscription no banco do FaunaDB
