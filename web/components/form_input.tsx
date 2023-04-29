interface FormInputProps {
    label: string,
    name: string,
    type?: string,
    required?: boolean,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    errorMessage?: string | null,
}

export default function FormInput({label, name, type="text", required=false, onChange, errorMessage}: FormInputProps) {
    return (
        <>
            <label className="block text-gray-800" htmlFor={name}>{label}</label>
            <input className="block w-full px-3 py-2 mt-1 text-purple-700 border rounded-md focus:border-purple-900 focus:ring-purple-600 focus:outline-none focus:ring focus:ring-opacity-30 border-gray-300 sm:text-sm " type={type} id={name} name={name} required={required} onChange={onChange} />
            {
                errorMessage &&
                <div style={{ color: 'red' }}>
                    {errorMessage}
                </div>
            }
            <br />
        </>
    )
}
