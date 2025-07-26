from django.core.management.base import BaseCommand
from apps.albums.models import EventType
from apps.authentication.models import User
from apps.albums.models import Album
import uuid


class Command(BaseCommand):
    help = 'Load initial data for EventVault'

    def handle(self, *args, **options):
        self.stdout.write('Loading initial data...')
        
        # Create event types
        event_types = [
            {
                'name': 'Düğün',
                'description': 'Düğün ve evlilik törenleri',
                'icon': '💒',
                'is_active': True
            },
            {
                'name': 'Nişan',
                'description': 'Nişan törenleri',
                'icon': '💍',
                'is_active': True
            },
            {
                'name': 'Doğum Günü',
                'description': 'Doğum günü kutlamaları',
                'icon': '🎂',
                'is_active': True
            },
            {
                'name': 'Mezuniyet',
                'description': 'Mezuniyet törenleri',
                'icon': '🎓',
                'is_active': True
            },
            {
                'name': 'Kurumsal Etkinlik',
                'description': 'Şirket etkinlikleri ve toplantılar',
                'icon': '🏢',
                'is_active': True
            },
            {
                'name': 'Parti',
                'description': 'Özel partiler ve kutlamalar',
                'icon': '🎉',
                'is_active': True
            },
            {
                'name': 'Seyahat',
                'description': 'Seyahat ve tatil anıları',
                'icon': '✈️',
                'is_active': True
            },
            {
                'name': 'Diğer',
                'description': 'Diğer özel etkinlikler',
                'icon': '📸',
                'is_active': True
            }
        ]
        
        for event_type_data in event_types:
            event_type, created = EventType.objects.get_or_create(
                name=event_type_data['name'],
                defaults=event_type_data
            )
            if created:
                self.stdout.write(f'Created event type: {event_type.name}')
            else:
                self.stdout.write(f'Event type already exists: {event_type.name}')
        
        # Create sample user if not exists
        sample_user, created = User.objects.get_or_create(
            email='demo@eventvault.com',
            defaults={
                'username': 'demo_user',
                'first_name': 'Demo',
                'last_name': 'User',
                'is_staff': False,
                'is_superuser': False
            }
        )
        
        if created:
            sample_user.set_password('demo123')
            sample_user.save()
            self.stdout.write('Created sample user: demo@eventvault.com (password: demo123)')
        else:
            self.stdout.write('Sample user already exists: demo@eventvault.com')
        
        # Create sample albums
        sample_albums = [
            {
                'title': 'Ahmet & Ayşe Düğünü',
                'event_type': EventType.objects.get(name='Düğün'),
                'event_date': '2024-06-15',
                'event_location': 'İstanbul, Türkiye',
                'description': 'Ahmet ve Ayşe\'nin muhteşem düğün töreni',
                'privacy': 'private',
                'owner': sample_user
            },
            {
                'title': 'Mezuniyet Balosu 2024',
                'event_type': EventType.objects.get(name='Mezuniyet'),
                'event_date': '2024-07-01',
                'event_location': 'Ankara Üniversitesi',
                'description': '2024 mezuniyet balosu anıları',
                'privacy': 'public',
                'owner': sample_user
            },
            {
                'title': 'Doğum Günü Kutlaması',
                'event_type': EventType.objects.get(name='Doğum Günü'),
                'event_date': '2024-05-20',
                'event_location': 'Ev',
                'description': 'Özel doğum günü kutlaması',
                'privacy': 'private',
                'owner': sample_user
            }
        ]
        
        for album_data in sample_albums:
            album, created = Album.objects.get_or_create(
                title=album_data['title'],
                owner=album_data['owner'],
                defaults=album_data
            )
            if created:
                self.stdout.write(f'Created sample album: {album.title}')
            else:
                self.stdout.write(f'Sample album already exists: {album.title}')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully loaded initial data!')
        ) 