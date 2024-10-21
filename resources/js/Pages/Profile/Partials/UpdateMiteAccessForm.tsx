import { useRef, FormEventHandler, useState, useEffect, useMemo } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

function MiteEntry({accessToken: accessToken, id, name, placeholder, className = ''}: {accessToken: string, id: string, name: string, placeholder?: string, className?: string}) {
    const { data, setData, errors, put, post, reset, processing, recentlySuccessful, delete: destroy} = useForm({
        access_token: accessToken,
        id: id,
        name: name,
    });
    
    const updateAcessToken: FormEventHandler = (e) => {
        e.preventDefault();        
        if (id){
            put(route('mite-accesses.update', data.id), {
                preserveScroll: true,
                onSuccess: () => {},
                onError: (errors) => {
                    console.log(errors);
                },
            });
        } else {
            post(route('mite-accesses.store'), {
                preserveScroll: true,
                onSuccess: () => reset(),
                onError: (errors) => {
                    console.log(errors);
                },
                data: {
                    access_token: data.access_token,
                    name: data.name
                }
            });
        }
    };

    const removeAcessToken: FormEventHandler = (e) => {
        e.preventDefault();        

        destroy(route('mite-accesses.destroy', data.id), {
            preserveScroll: true,
            onSuccess: () => {reset()},
            onError: (errors) => {
                console.log(errors);
            },
        });
    }

    const changed = useMemo(() => {
        return (data.access_token !== accessToken || data.name !== name);
    }, [data.access_token, accessToken, data.name, name]);

    return (
        <form 
            onSubmit={updateAcessToken}
            className={`flex items-center justify-between space-x-4 ${className}`}
        >
            <TextInput
                type="text"
                name="access_token"
                className="mt-1 flex-1"
                onChange={(e) => setData('access_token', e.target ? e.target.value : '')}
                value={data.access_token}
                placeholder={placeholder}
                autoComplete='off'
                autoCorrect='off'
            />
            <TextInput 
                type="hidden"
                name="id"
                value={data.id}
            />
            <TextInput
                type="text"
                name="name"
                className="mt-1 flex-1"
                onChange={(e) => setData('name', e.target ? e.target.value : '')}
                value={data.name}
                placeholder="Give it a name"
                autoComplete='off'
            />
            {changed && <PrimaryButton disabled={processing} onClick={updateAcessToken}>Save</PrimaryButton>}
            {id && <PrimaryButton disabled={processing} onClick={removeAcessToken}>Delete</PrimaryButton>}
        </form>
    );
}

export default function UpdateMiteAccessForm({accessTokens, className = '' }: {accessTokens: {id: string, access_token: string, name: string}[], className?: string }) {

    console.log(accessTokens);
    

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Mite Access-Tokens</h2>
            </header>

            <div className="mt-6 space-y-6">

                { accessTokens.map((token, index) => (
                    <MiteEntry key={index} accessToken={token.access_token} id={token.id} name={token.name} placeholder={token.access_token} />
                ))
                }

                <MiteEntry accessToken="" id="" name='' placeholder="Add new access token"/>
            </div>
        </section>
    );
}
