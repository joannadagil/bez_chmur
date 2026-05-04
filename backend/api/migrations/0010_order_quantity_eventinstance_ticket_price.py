from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_eventinstance_host'),
    ]

    operations = [
        migrations.AddField(
            model_name='eventinstance',
            name='ticket_price',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10),
        ),
        migrations.AddField(
            model_name='order',
            name='quantity',
            field=models.IntegerField(default=1),
        ),
    ]
