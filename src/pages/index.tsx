import {GetStaticProps} from 'next';

import Head from 'next/head';
import { SubscribeButton } from '../components/SubscribeButton';
import { stripe } from '../services/stripe';

import styles from './home.module.scss';

interface HomeProps{
  product:{
    priceId: string;
    amount: number;
  }
}

export default function Home({product}:HomeProps) {
  return (
    <>    
    <Head>
      <title>ig.news</title>
    </Head>  
    <main className={styles.contentContainer}>
      <section className={styles.hero}>
        <span>👋 Hey, welcome</span> 
        {/* CTRL + i chama o smiley */}
        <h1>News about the <span>React</span> wold.</h1>
        <p>
          Get access to all the publications <br/>
          <span>for {product.amount} month</span>
        </p>
        <SubscribeButton priceId={product.priceId}/>
      </section>

      <img src="/images/avatar.svg" alt="Girl coding" />
    </main>
    </>    
   )
}

export const getStaticProps :GetStaticProps = async () => {
  const price = await stripe.prices.retrieve('price_1IoAp0HgUscePIR8rD5ub1ny', {
    // expand:['product'] se vc quiser mostrar todos os dados do product 
  })

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style:'currency',
      currency:'USD',      
    }).format(price.unit_amount / 100),
  };

  return {
    props:{
      product,
    },
    revalidate: 60 * 60 * 24, //24horas
  }
}
  
