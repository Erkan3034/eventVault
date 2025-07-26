from django.core.management.base import BaseCommand
from apps.notifications.models import NotificationTemplate


class Command(BaseCommand):
    help = 'Load notification email templates'

    def handle(self, *args, **options):
        self.stdout.write('Loading notification templates...')
        
        templates = [
            {
                'name': 'welcome',
                'template_type': 'welcome',
                'subject': 'EventVault\'a Hoş Geldiniz! 🎉',
                'html_content': '''
                <h1>🎉 EventVault'a Hoş Geldiniz!</h1>
                <p>Merhaba {{ user.first_name }}!</p>
                <p>EventVault ailesine katıldığınız için teşekkür ederiz!</p>
                ''',
                'text_content': 'EventVault\'a Hoş Geldiniz! Merhaba {{ user.first_name }}!',
                'available_variables': ['user', 'album', 'upload'],
                'is_active': True
            },
            {
                'name': 'new_upload',
                'template_type': 'new_upload',
                'subject': 'Yeni Dosya Yüklendi - {{ album.title }}',
                'html_content': '''
                <h1>📸 Yeni Dosya Yüklendi!</h1>
                <p>Merhaba {{ user.first_name }}!</p>
                <p><strong>{{ album.title }}</strong> albümünüze yeni bir dosya yüklendi.</p>
                <p>Dosya: {{ upload.original_filename }}</p>
                ''',
                'text_content': 'Yeni Dosya Yüklendi! {{ album.title }} albümünüze {{ upload.original_filename }} dosyası yüklendi.',
                'available_variables': ['user', 'album', 'upload'],
                'is_active': True
            }
        ]
        
        for template_data in templates:
            template, created = NotificationTemplate.objects.get_or_create(
                name=template_data['name'],
                defaults=template_data
            )
            if created:
                self.stdout.write(f'Created template: {template.name}')
            else:
                self.stdout.write(f'Template already exists: {template.name}')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully loaded notification templates!')
        ) 