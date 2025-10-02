from rest_framework.permissions import BasePermission
class IsParticipantOrStaff(BasePermission):
    def has_permission(self, request, view):
        if request.user and request.user.is_staff: return True
        try: room = view.get_room()
        except Exception: return False
        return room.participants.filter(user=request.user).exists()
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff: return True
        room = getattr(obj, "room", None) or getattr(view, "get_room", lambda: None)()
        return bool(room and room.participants.filter(user=request.user).exists())
