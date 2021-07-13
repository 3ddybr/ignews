import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { fauna } from "../../services/fauna";
import {query as q} from 'faunadb';
import { stripe } from "../../services/stripe";


type User ={
    ref:{
        id: string;
    }
    data:{
        stripe_customer_id: string;
    }
}

export default async (req:NextApiRequest, res:NextApiResponse) => {
    if (req.method === 'POST') {
        const session = await getSession({req});

        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        )  

        let customerId = user.data.stripe_customer_id //a var let pega o customer_id que esta no bando se nao faz abaixo

        if (!customerId) { //se nao existe ela cria aqui
            const stripeCustomer = await stripe.customers.create({
                email: session.user.email,
                //metadata
            })

            await fauna.query ( //salva no banco o novo customer
                q.Update(
                    q.Ref(q.Collection('users'), user.ref.id),
                    {
                        data: {
                            stripe_customer_id: stripeCustomer.id,
                        }
                    }
                )
            )
            customerId=stripeCustomer.id //depois reatribui a variável
        }        

        const stripeCheckoutSession = await stripe.checkout.sessions.create({

            customer: customerId,
            payment_method_types:['card'], //quais métodos de pagamentos devo aceitar
            billing_address_collection: 'required', //obrigar o usuário a preencher o endereço 'required' ou deixar 'auto' e config dentro do painel do stripe
            line_items:[
                {price: 'price_1IoAp0HgUscePIR8rD5ub1ny', quantity: 1} //ID do preço fica dentro do index home
            ],
            mode: 'subscription', //pagamento recorrente e nao de uma única vez
            allow_promotion_codes:true, //permite o user entrar com um cupom de desconto
            success_url: process.env.STRIPE_SUCCESS_URL, //variável ambiente dentro de .env.local
            cancel_url:process.env.STRIPE_CANCEL_URL
        })

        return res.status(200).json({sessionId:stripeCheckoutSession.id});
    }else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method not allowed');
    }

}