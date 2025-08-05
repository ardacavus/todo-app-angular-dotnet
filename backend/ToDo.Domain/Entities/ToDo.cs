namespace ToDo.Domain.Entities
{
    public class ToDo
    {
        public int Id { get; set; }  // INT IDENTITY(1,1) için
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}