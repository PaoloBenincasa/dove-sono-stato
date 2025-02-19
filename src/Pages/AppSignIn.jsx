import supabase from "../supabase/client";
import { useNavigate, Link } from "react-router";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppSignIn() {
    const navigate = useNavigate();
    const handleSignIn = async (event) => {
        event.preventDefault();
        const formLogin = event.currentTarget;
        const { email, password } = Object.fromEntries(new FormData(formLogin));
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) {
                toast.error('Accesso non riuscito')
            } else {
                toast.success('Accesso avvenuto correttamente!')
                await new Promise((resolve) => setTimeout(resolve, 2000));

                formLogin.reset();
                navigate('/profile');
            }
        } catch (error) {
            alert(error)
        }

    }
    return (
        <>
            <div className="container-fluid pt-5 bgDarkgreen h-100 ">
                <div className="row mt-5 align-items-center justify-content-center">
                    <div className="col-md-6 bg-white rounded shadow">
                        <h1 className="txtDarkgreen mt-2">Login</h1>
                        <form onSubmit={handleSignIn} className="p-3 ">
                            <div className="mb-3 ">
                                <label htmlFor="email" className="form-label ">Email address</label>
                                <input type="email" className="form-control" id="email" aria-describedby="emailHelp" name="email" />
                            </div>
                            <div className="mb-3 ">
                                <label htmlFor="password" className="form-label ">Password</label>
                                <input type="password" className="form-control" id="password" name="password" />
                            </div>

                            <button type="submit" className="btn btn-search mb-3 mt-1">Submit</button>
                            <p className="">Non hai ancora un account? <Link to={`/signup`} className="">registrati</Link> </p>

                        </form>
                        <ToastContainer position="bottom-right"
                            autoClose={2000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick={true}
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="light"
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default AppSignIn;