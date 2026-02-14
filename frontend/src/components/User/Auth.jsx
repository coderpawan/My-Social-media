import React from 'react';
import homepage from '../../assests/images/homepage.png';

const Auth = ({ children }) => {
    return (
        <div className="flex items-center justify-center w-full h-screen bg-gray-50 overflow-hidden">

            <div className="flex w-full max-w-4xl gap-8 items-center justify-center p-4">
                <div 
                    className="hidden md:block relative bg-no-repeat bg-cover"
                    style={{
                        backgroundImage: "url('https://www.instagram.com/static/images/homepage/phones/home-phones.png/1dc085cdb87d.png')",
                        width: '460px', 
                        height: '635px',
                        backgroundPosition: '-46px 0'
                    }}
                >
                    <img 
                        draggable="false" 
                        className="absolute top-[27px] right-[50px] h-[540px] w-[250px]"
                        src={homepage} 
                        alt="homepage" 
                    />
                </div>
                <div className="flex flex-col w-full max-w-[350px]">
                    {children}
                </div>

            </div>
        </div>
    )
}

export default Auth;