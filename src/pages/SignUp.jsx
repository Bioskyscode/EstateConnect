import { useState } from 'react'
import { Link, useNavigate, } from 'react-router-dom'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { db } from '../firebase.config'
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from 'react-toastify';
import OAuth from '../components/OAuth';


function SignUp() {
    const navigate = useNavigate()
    const [showPassword, setShowPasswoord] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    })
    const { name, email, password } = formData

    const onChange = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.id]: e.target.value

        }))
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const auth = getAuth()
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            updateProfile(auth.currentUser,
                {
                    displayName: name,

                })

                const formDataCopy = {...formData}
                delete formDataCopy.password
                formDataCopy.timestamp = serverTimestamp()

                await setDoc(doc(db, "users", user.uid), formDataCopy)
            navigate("/")
        } catch (error) {
            toast.error("Something went wrong with the registration")
        }
    }
    return (
        <>
            <div className='pageContainer form'>
                <header>
                    <p className='pageHeader'> W<span>elcom</span>e B<span>ac</span>k!</p>
                </header>
                <form onSubmit={onSubmit}>
                    <input type="name" className='nameInput' placeholder='Name' id='name' value={name} onChange={onChange} />

                    <input type="email" className='emailInput' placeholder='Email' id='email' value={email} onChange={onChange} />

                    <div className='passwordInputDiv'>
                        <input type={showPassword ? "text" : "password"} placeholder='Password' id="password" className='passwordInput' value={password} onChange={onChange} />
                        <img src={visibilityIcon} alt="show password" className='showPassword' onClick={() => setShowPasswoord(!showPassword)} />
                    </div>

                    {/* <Link className='forgotPasswordLink' to="/forgot-password">Forgot Password ?</Link> */}

                    <div className='signUpBar'>
                        <p className='signInText'>Sign Up</p>
                        <button className="signUpButton"><ArrowRightIcon fill='white' width='34px' height='34px' /></button>
                    </div>

                </form>
                <OAuth />
                <Link to="/sign-in" className="registerLink">Already have an account ?</Link>
            </div>
        </>
    )
}

export default SignUp