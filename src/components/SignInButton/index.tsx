import styles from './styles.module.scss';

import {FaGithub} from 'react-icons/fa';
import {FiX} from 'react-icons/fi'
import {signIn, signOut, useSession} from 'next-auth/client'

export function SignInButton() {
    const [session]=useSession()

    // console.log(session);

    return session ? (
        <button
         type="button"
         className={styles.signInButton}
         onClick={()=>signOut()}
         >
             <img src={session.user.image} alt="" />
             {session.user.name}
            {/* <FaGithub color="#04d361"/> */}
            {/* Alberto Consoli */}
            <FiX color="#737380" className={styles.closeIcon}/>
        </button>
    ) : (
        //pode se ter um button pra cada provider de auth
        <button
         type="button"
         className={styles.signInButton}
         onClick={()=> signIn('github')}
         >
            <FaGithub color="#eba417"/>
            Sing in with GitHub
        </button>
    );       
    
}