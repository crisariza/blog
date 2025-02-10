module.exports = {
    async redirects() {
        return [
            {
                source: '/wpp',
                destination: 'https://api.whatsapp.com/send?phone=541123885841',
                permanent: true,
            },
            {
                source: '/girlfriend',
                destination: 'https://www.instagram.com/agust6na/',
                permanent: true,
            },
        ];
    },
};

