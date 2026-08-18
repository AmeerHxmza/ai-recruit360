"""
Base Repository Implementation for Supabase Table Access
"""

from typing import Generic, TypeVar, List, Optional, Dict, Any
from src.core.supabase_client import supabase

T = TypeVar("T")


class BaseRepository(Generic[T]):
    def __init__(self, table_name: str):
        self.table_name = table_name

    def select(self, columns: str = "*") -> Any:
        return supabase.table(self.table_name).select(columns)

    def get_by_id(self, item_id: str, columns: str = "*") -> Optional[Dict[str, Any]]:
        res = supabase.table(self.table_name).select(columns).eq("id", item_id).execute()
        if res.data:
            return res.data[0]
        return None

    def insert(self, data: Dict[str, Any]) -> Dict[str, Any]:
        res = supabase.table(self.table_name).insert(data).execute()
        if res.data:
            return res.data[0]
        raise Exception(f"Failed to insert into table '{self.table_name}'.")

    def update(self, item_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        res = supabase.table(self.table_name).update(data).eq("id", item_id).execute()
        if res.data:
            return res.data[0]
        raise Exception(f"Failed to update item '{item_id}' in table '{self.table_name}'.")

    def delete(self, item_id: str) -> bool:
        res = supabase.table(self.table_name).delete().eq("id", item_id).execute()
        return bool(res.data)
