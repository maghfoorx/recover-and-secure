export function formatDate(inputDate: string) {
    const date = new Date(inputDate);
    const options = { 
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }
return date.toLocaleDateString('en-GB', options);
}