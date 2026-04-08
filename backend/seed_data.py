import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Event, EventCategory, Venue, EventInstance, SeatCategory, EventSeat, Seat
from django.utils import timezone
from decimal import Decimal

def seed():
    # Create categories
    categories = {}
    for cat_name in ['Cinema', 'Theatre', 'Lecture']:
        obj, _ = EventCategory.objects.get_or_create(name=cat_name)
        categories[cat_name] = obj

    # Adding example data
    mock_data = [
        {
            'title': 'Dune: Part Two',
            'venue': '12+ cinemas',
            'type': 'Cinema',
            'price': 5,
            'url': 'https://www.superherotoystore.com/cdn/shop/articles/dune-part-two-2024-5k-rl-3840x2400_1600x.jpg?v=1709290352'},
        {
            'title': 'Romeo and Juliet',
            'venue': 'National Theatre',
            'type': 'Theatre', 
            'price': 21,
            'url': 'https://cdn.svvoice.com/wp-content/uploads/2019/06/18020648/3-Balcony-credit-Jay-Yamada-Copy.jpg'},
        {
            'title': 'AI & Society - Open Lecture',
            'venue': 'Warsaw University of Technology',
            'type': 'Lecture',
            'price': 'Free',
            'url': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=500&auto=format&fit=crop',
        },
        {
            'title': 'La La Land - City of Stars',
            'venue': 'Multikino',
            'type': 'Cinema',
            'price': 8,
            'url': 'https://occ-0-8407-2219.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABe0k0-UurHVbx9fm2hTVfoTVYElSw7GWMcvc1JAfGPsqraunVJBWewzMWxs8GmB4an5YQM1BPv3Y37wubHYKAJZ50hBn0oEfpX-m.jpg?r=ada',
        },
        {
            'title': 'Beetlejuice The Musical',
            'venue': 'Teatr Roma',
            'type': 'Theatre',
            'price': 25,
            'url': 'https://beetlejuicethemusical.com.au/wp-content/uploads/2025/06/beetlejuice-title.jpg',
        },
        {
            'title': 'Moulin Rouge! The Musical',
            'venue': 'Teatr Muzyczny Buffo',
            'type': 'Theatre',
            'price': 30,
            'url': 'https://aws-tiqets-cdn.imgix.net/images/content/af800c2a213a46b28e696d9efae8fcba.jpg?auto=format%2Ccompress&fit=crop&q=70&w=600&s=61daa83f62dc8edda6220caaa0ea0639',
        },
        {
            'title': 'Poor Things',
            'venue': 'Kino Muranów',
            'type': 'Cinema',
            'price': 10,
            'url': 'https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/019b2681-dd36-726b-acb2-b16a5872d0b6/compose?aspectRatio=1.78&format=webp&width=1200',
        },
        {
            'title': 'Phantom of the Opera',
            'venue': 'Teatr Wielki',
            'type': 'Theatre',
            'price': 45,
            'url': 'https://d28054jbxkgsih.cloudfront.net/uploads/_fullCroppedImage/CML_Production-Page-Banner_1920x1080_3_AW.jpg?v=1764185437',
        },
        {
            'title': 'The Secret Life of Trees',
            'venue': 'Lecture Hall B2',
            'type': 'Lecture',
            'price': 5,
            'url': 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=800',
        }
    ]

    for item in mock_data:
        # Create venue
        venue, _ = Venue.objects.get_or_create(
            name=item['venue'], 
            defaults={
                'rows': 10, 
                'seats_per_row': 10},
        )

        # Create event
        event, _ = Event.objects.get_or_create(
            name=item['title'],
            defaults={
                'category': categories[item['type']],
                'image_url': item['url'],    
            }
        )

        # Create event instance
        instance = EventInstance.objects.create(
            event=event,
            venue=venue,
            time=timezone.now() + timezone.timedelta(days=1)
        )

        # Create pricec
        price_val = 0 if item['price'] == 'Free' else item['price']
        seat_cat, _ = SeatCategory.objects.get_or_create(
            name=f'Standard for {event.name}',
            defaults={'price': Decimal(price_val)}
        )

        # Adding seats
        seats = Seat.objects.filter(venue=venue)
        for seat in seats:
            EventSeat.objects.create(
                seat=seat,
                event_instance=instance,
                seat_category=seat_cat
            )
            
    print('Data loaded')

if __name__ == '__main__':
    seed()