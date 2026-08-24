from django.core.management.base import BaseCommand
from apps.albums.models import EventType, Album
from apps.authentication.models import User


class Command(BaseCommand):
    help = 'Load initial data for EventVault'

    def handle(self, *args, **options):
        self.stdout.write('Loading initial data...')

        event_types = [
            {'name': 'Wedding', 'name_tr': 'Düğün', 'icon': 'heart', 'color': '#ff6b9d'},
            {'name': 'Engagement', 'name_tr': 'Nişan', 'icon': 'ring', 'color': '#ff9ff3'},
            {'name': 'Birthday', 'name_tr': 'Doğum Günü', 'icon': 'cake', 'color': '#feca57'},
            {'name': 'Graduation', 'name_tr': 'Mezuniyet', 'icon': 'graduation-cap', 'color': '#48cae4'},
            {'name': 'Corporate Event', 'name_tr': 'Kurumsal Etkinlik', 'icon': 'building', 'color': '#00d2d3'},
            {'name': 'Party', 'name_tr': 'Parti', 'icon': 'party', 'color': '#54a0ff'},
            {'name': 'Travel', 'name_tr': 'Seyahat', 'icon': 'plane', 'color': '#10b981'},
            {'name': 'Other', 'name_tr': 'Diğer', 'icon': 'camera', 'color': '#6b7280'},
        ]

        for event_type_data in event_types:
            event_type, created = EventType.objects.get_or_create(
                name=event_type_data['name'],
                defaults={**event_type_data, 'is_active': True}
            )
            if created:
                self.stdout.write(f'Created event type: {event_type.name_tr}')
            else:
                updated = False
                if not event_type.name_tr:
                    event_type.name_tr = event_type_data['name_tr']
                    updated = True
                if updated:
                    event_type.save()
                self.stdout.write(f'Event type already exists: {event_type.name}')

        sample_user, created = User.objects.get_or_create(
            email='demo@eventvault.com',
            defaults={
                'username': 'demo_user',
                'first_name': 'Demo',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': False,
            }
        )

        if created:
            sample_user.set_password('demo123')
            sample_user.save()
            self.stdout.write('Created sample user: demo@eventvault.com (password: demo123)')
        else:
            if not sample_user.is_staff:
                sample_user.is_staff = True
                sample_user.save(update_fields=['is_staff'])
            self.stdout.write('Sample user already exists: demo@eventvault.com')

        from apps.authentication.models import Profile
        Profile.objects.get_or_create(user=sample_user)

        sample_albums = [
            {
                'title': 'Ahmet & Ayşe Düğünü',
                'event_type': EventType.objects.get(name='Wedding'),
                'event_date': '2024-06-15',
                'event_location': 'İstanbul, Türkiye',
                'description': "Ahmet ve Ayşe'nin muhteşem düğün töreni",
                'privacy': 'private',
                'status': 'active',
                'owner': sample_user,
            },
            {
                'title': 'Mezuniyet Balosu 2024',
                'event_type': EventType.objects.get(name='Graduation'),
                'event_date': '2024-07-01',
                'event_location': 'Ankara Üniversitesi',
                'description': '2024 mezuniyet balosu anıları',
                'privacy': 'public',
                'status': 'active',
                'owner': sample_user,
            },
            {
                'title': 'Doğum Günü Kutlaması',
                'event_type': EventType.objects.get(name='Birthday'),
                'event_date': '2024-05-20',
                'event_location': 'Ev',
                'description': 'Özel doğum günü kutlaması',
                'privacy': 'private',
                'status': 'active',
                'owner': sample_user,
            },
        ]

        for album_data in sample_albums:
            album, created = Album.objects.get_or_create(
                title=album_data['title'],
                owner=album_data['owner'],
                defaults=album_data
            )
            if created:
                self.stdout.write(f'Created sample album: {album.title}')
            elif album.status != 'active':
                album.status = 'active'
                album.save(update_fields=['status'])
                self.stdout.write(f'Activated existing album: {album.title}')
            else:
                self.stdout.write(f'Sample album already exists: {album.title}')

        self.stdout.write(self.style.SUCCESS('Successfully loaded initial data!'))
