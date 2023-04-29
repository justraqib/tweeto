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
            <label htmlFor={name}>{label}</label>
            <input type={type} id={name} name={name} required={required} onChange={onChange} />
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
