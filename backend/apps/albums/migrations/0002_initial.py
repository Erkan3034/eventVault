# Generated by Django 4.2.7 on 2025-07-26 21:45

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('albums', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='albumcollaborator',
            name='invited_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='album_invitations_sent', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='albumcollaborator',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='collaborated_albums', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='album',
            name='event_type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='albums', to='albums.eventtype', verbose_name='event type'),
        ),
        migrations.AddField(
            model_name='album',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='owned_albums', to=settings.AUTH_USER_MODEL, verbose_name='owner'),
        ),
        migrations.AlterUniqueTogether(
            name='albumcollaborator',
            unique_together={('album', 'user')},
        ),
    ]
