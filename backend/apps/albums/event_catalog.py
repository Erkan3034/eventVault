"""Canonical event types shown in album creation and the admin catalog."""

EVENT_TYPES = [
    # Düğün & özel günler
    {'name': 'Wedding', 'name_tr': 'Düğün', 'icon': 'heart', 'color': '#C45B7A', 'sort_order': 10},
    {'name': 'Civil Wedding', 'name_tr': 'Nikah', 'icon': 'scroll', 'color': '#8B6B4A', 'sort_order': 20},
    {'name': 'Engagement', 'name_tr': 'Nişan', 'icon': 'ring', 'color': '#C9A05F', 'sort_order': 30},
    {'name': 'Promise Ceremony', 'name_tr': 'Söz', 'icon': 'hands', 'color': '#D4B07A', 'sort_order': 40},
    {'name': 'Henna Night', 'name_tr': 'Kına', 'icon': 'sparkles', 'color': '#B3541E', 'sort_order': 50},
    {'name': 'Bridal Shower', 'name_tr': 'Bekarlığa Veda (Gelin)', 'icon': 'sparkle', 'color': '#E08AA4', 'sort_order': 60},
    {'name': 'Bachelor Party', 'name_tr': 'Bekarlığa Veda (Damat)', 'icon': 'glass', 'color': '#3D5A80', 'sort_order': 70},
    {'name': 'After Party', 'name_tr': 'After Party', 'icon': 'music', 'color': '#2C1E4A', 'sort_order': 80},
    {'name': 'Wedding Proposal', 'name_tr': 'Evlilik Teklifi', 'icon': 'diamond', 'color': '#9B2335', 'sort_order': 90},
    {'name': 'Anniversary', 'name_tr': 'Yıldönümü', 'icon': 'calendar-heart', 'color': '#A33B5D', 'sort_order': 100},
    # Bebek & aile
    {'name': 'Gender Reveal', 'name_tr': 'Cinsiyet Partisi', 'icon': 'baby', 'color': '#7EB8D4', 'sort_order': 110},
    {'name': 'Baby Shower', 'name_tr': 'Baby Shower', 'icon': 'gift', 'color': '#F2B5D4', 'sort_order': 120},
    {'name': 'Welcome Baby', 'name_tr': 'Bebek Mevlidi / Hoş Geldin', 'icon': 'star', 'color': '#E8C9A0', 'sort_order': 130},
    {'name': 'Circumcision', 'name_tr': 'Sünnet', 'icon': 'moon', 'color': '#2E7D4F', 'sort_order': 140},
    {'name': 'Birthday', 'name_tr': 'Doğum Günü', 'icon': 'cake', 'color': '#E0A84A', 'sort_order': 150},
    {'name': 'Mothers Day', 'name_tr': 'Anneler Günü', 'icon': 'flower', 'color': '#D97890', 'sort_order': 160},
    {'name': 'Fathers Day', 'name_tr': 'Babalar Günü', 'icon': 'anchor', 'color': '#3E5C76', 'sort_order': 170},
    # Eğitim
    {'name': 'Graduation', 'name_tr': 'Mezuniyet', 'icon': 'graduation-cap', 'color': '#1A4B7A', 'sort_order': 180},
    {'name': 'School Event', 'name_tr': 'Okul Etkinliği', 'icon': 'book', 'color': '#4A6FA5', 'sort_order': 190},
    # Kurumsal
    {'name': 'Corporate Event', 'name_tr': 'Kurumsal Etkinlik', 'icon': 'building', 'color': '#1A2748', 'sort_order': 200},
    {'name': 'Product Launch', 'name_tr': 'Lansman', 'icon': 'rocket', 'color': '#C45C26', 'sort_order': 210},
    {'name': 'Conference', 'name_tr': 'Konferans / Seminer', 'icon': 'mic', 'color': '#355070', 'sort_order': 220},
    {'name': 'Workshop', 'name_tr': 'Workshop', 'icon': 'tools', 'color': '#6B705C', 'sort_order': 230},
    {'name': 'Team Building', 'name_tr': 'Team Building', 'icon': 'users', 'color': '#2A6F6F', 'sort_order': 240},
    {'name': 'Networking', 'name_tr': 'Networking', 'icon': 'network', 'color': '#3D5A80', 'sort_order': 250},
    {'name': 'Gala', 'name_tr': 'Gala / Ödül Töreni', 'icon': 'award', 'color': '#B8975A', 'sort_order': 260},
    {'name': 'Opening', 'name_tr': 'Açılış', 'icon': 'door', 'color': '#7A5C3A', 'sort_order': 270},
    {'name': 'Press Event', 'name_tr': 'Basın Toplantısı', 'icon': 'news', 'color': '#4C5C68', 'sort_order': 280},
    # Sosyal & kutlama
    {'name': 'Party', 'name_tr': 'Parti', 'icon': 'party', 'color': '#5B4B8A', 'sort_order': 290},
    {'name': 'Cocktail', 'name_tr': 'Kokteyl', 'icon': 'cocktail', 'color': '#8E3B46', 'sort_order': 300},
    {'name': 'Dinner Party', 'name_tr': 'Yemek Daveti', 'icon': 'utensils', 'color': '#6B3F2A', 'sort_order': 310},
    {'name': 'Brunch', 'name_tr': 'Brunch', 'icon': 'sun', 'color': '#D4A373', 'sort_order': 320},
    {'name': 'Housewarming', 'name_tr': 'Yeni Ev', 'icon': 'home', 'color': '#8A6D4A', 'sort_order': 330},
    {'name': 'Farewell', 'name_tr': 'Veda Partisi', 'icon': 'plane', 'color': '#4A6274', 'sort_order': 340},
    {'name': 'Reunion', 'name_tr': 'Buluşma / Reunion', 'icon': 'users', 'color': '#3F6F5B', 'sort_order': 350},
    {'name': 'New Year', 'name_tr': 'Yılbaşı', 'icon': 'sparkles', 'color': '#1A2748', 'sort_order': 360},
    {'name': 'Valentines Day', 'name_tr': 'Sevgililer Günü', 'icon': 'heart', 'color': '#9B2335', 'sort_order': 370},
    # Kültür & inanç
    {'name': 'Iftar', 'name_tr': 'İftar / Sahur', 'icon': 'moon', 'color': '#2C5F2D', 'sort_order': 380},
    {'name': 'Eid', 'name_tr': 'Bayram', 'icon': 'star', 'color': '#C9A05F', 'sort_order': 390},
    {'name': 'Mawlid', 'name_tr': 'Mevlit', 'icon': 'book', 'color': '#4A6741', 'sort_order': 400},
    {'name': 'Memorial', 'name_tr': 'Anma Töreni', 'icon': 'candle', 'color': '#5C5C5C', 'sort_order': 410},
    # Sanat & spor
    {'name': 'Concert', 'name_tr': 'Konser', 'icon': 'music', 'color': '#3B1F5C', 'sort_order': 420},
    {'name': 'Festival', 'name_tr': 'Festival', 'icon': 'flag', 'color': '#C45C26', 'sort_order': 430},
    {'name': 'Art Exhibition', 'name_tr': 'Sergi', 'icon': 'frame', 'color': '#6B4F3A', 'sort_order': 440},
    {'name': 'Sports Event', 'name_tr': 'Spor Etkinliği', 'icon': 'trophy', 'color': '#1F4E3D', 'sort_order': 450},
    {'name': 'Picnic', 'name_tr': 'Piknik', 'icon': 'tree', 'color': '#4F7A3C', 'sort_order': 460},
    {'name': 'Travel', 'name_tr': 'Seyahat', 'icon': 'plane', 'color': '#2A6F97', 'sort_order': 470},
    {'name': 'Other', 'name_tr': 'Diğer', 'icon': 'camera', 'color': '#6B7280', 'sort_order': 999},
]
