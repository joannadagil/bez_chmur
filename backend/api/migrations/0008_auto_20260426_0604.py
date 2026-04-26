from django.db import migrations

def give_all_permissions_to_group(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Permission = apps.get_model('auth', 'Permission')

    group, created = Group.objects.get_or_create(name='Host')

    all_perms = Permission.objects.all()

    group.permissions.set(all_perms)

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_rename_exist_seat_if_exist'),
    ]

    operations = [
        migrations.RunPython(give_all_permissions_to_group),
    ]