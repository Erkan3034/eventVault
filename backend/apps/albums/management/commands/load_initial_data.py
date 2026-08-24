from django.core.management.base import BaseCommand
from apps.albums.models import EventType, Album
from apps.albums.event_catalog import EVENT_TYPES
from apps.authentication.models import User


class Command(BaseCommand):
    help = 'Load initial data for EventVault'

    def handle(self, *args, **options):
        self.stdout.write('Loading initial data...')

        for event_type_data in EVENT_TYPES:
            event_type, created = EventType.objects.get_or_create(
                name=event_type_data['name'],
                defaults={**event_type_data, 'is_active': True},
            )
            if created:
                self.stdout.write(f'Created event type: {event_type.name_tr}')
            else:
                changed = []
                for field in ('name_tr', 'icon', 'color', 'sort_order'):
                    if getattr(event_type, field) != event_type_data[field]:
                        setattr(event_type, field, event_type_data[field])
                        changed.append(field)
                if not event_type.is_active:
                    event_type.is_active = True
                    changed.append('is_active')
                if changed:
                    event_type.save()
                    self.stdout.write(f'Updated event type: {event_type.name_tr}')
                else:
                    self.stdout.write(f'Event type already exists: {event_type.name_tr}')

        for event_type_data in EVENT_TYPES:
            canonical = EventType.objects.filter(name=event_type_data['name']).first()
            if not canonical:
                continue
            duplicates = EventType.objects.filter(name=event_type_data['name_tr']).exclude(pk=canonical.pk)
            for old in duplicates:
                moved = Album.objects.filter(event_type=old).update(event_type=canonical)
                self.stdout.write(
                    f'Merged duplicate type "{old.name}" → "{canonical.name_tr}" ({moved} albums)'
                )
                old.delete()

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
