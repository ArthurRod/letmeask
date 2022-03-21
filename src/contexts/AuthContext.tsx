import { createContext, useState, useEffect, ReactNode } from 'react'
import { auth, firebase } from '../services/firebase';

type User = {
	id: string;
	name: string;
	avatar: string;
}

type AuthContextType = {
	user: User | undefined; //se não tiver usuário logado será undefined
	signInWithGoogle: () => Promise<void>;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProviderProps) {
    const [user, setUser] = useState<User>();

	useEffect(() => {   //Hook para manter o login(estado) ao atualizar a página
		const unsubscribe = auth.onAuthStateChanged(user => { //Boa prática para o event listener não ficar executando para sempre
			if(user) {
				const { displayName, photoURL, uid } = user
				if (!displayName || !photoURL) {
					throw new Error('Missing information from Google Account.');
				}

				setUser({
					id: uid,
					name: displayName,
					avatar: photoURL
				})
			}
		})

		return () => {
			unsubscribe();
		}
	}, [])

	async function signInWithGoogle() {
		const provider = new firebase.auth.GoogleAuthProvider();
		const result = await auth.signInWithPopup(provider)

		
		if (result.user) {
			const { displayName, photoURL, uid } = result.user
			if (!displayName || !photoURL) {
				throw new Error('Missing information from Google Account.');
			}

			setUser({
				id: uid,
				name: displayName,
				avatar: photoURL
			})
		}
	}
    
    return (
        <AuthContext.Provider value={{ user, signInWithGoogle }}>
            {props.children}
        </AuthContext.Provider>
    );
}