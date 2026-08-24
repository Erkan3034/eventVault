let gisLoader;

export const loadGoogleIdentity = () => {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        return Promise.resolve();
    }
    if (gisLoader) return gisLoader;

    gisLoader = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-google-gis]');
        if (existing) {
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', () => reject(new Error('Google oturumu yüklenemedi.')));
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.dataset.googleGis = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Google oturumu yüklenemedi.'));
        document.head.appendChild(script);
    });

    return gisLoader;
};

export const requestDriveAccessToken = (clientId, scope) => new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: scope || 'https://www.googleapis.com/auth/drive.file',
        callback: (response) => {
            if (!response || response.error || !response.access_token) {
                reject(new Error('Google Drive izni alınamadı.'));
                return;
            }
            resolve(response.access_token);
        },
        error_callback: () => reject(new Error('Google penceresi kapatıldı.')),
    });
    client.requestAccessToken({ prompt: 'consent' });
});
