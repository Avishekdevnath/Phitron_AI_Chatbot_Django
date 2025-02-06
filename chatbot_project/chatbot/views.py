from django.shortcuts import render
from django.http import JsonResponse
import google.generativeai as genai
from django.conf import settings
import markdown2
from .models import ChatMessage


genai.configure(api_key=settings.GEMINI_API_KEY)


SYSTEM_PROMPT = """You are Phitron Support AI specializing in programming and technology.
- Maintain context throughout the conversation.
- If the user asks for coding help, respond with "Yes, I can help you with coding problems. Please describe your issue."
- If the user asks for an explanation of code, refer to previous messages.
- Format responses properly using Markdown for clarity.
"""

def format_response(response_text):
    """Convert AI response to HTML-friendly format."""
    return markdown2.markdown(response_text, extras=["fenced-code-blocks", "break-on-newline"]).strip()

def chat(request):
    if request.method == 'POST':
        user_input = request.POST.get('user_input')


        chat_history = ChatMessage.objects.order_by('-created_at')[:5]  # Get last 5 messages
        conversation = SYSTEM_PROMPT + "\n" + "\n".join([f"User: {msg.user_input}\nAI: {msg.bot_response}" for msg in chat_history])
        conversation += f"\nUser: {user_input}\nAI:"

        
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(conversation)

        
        bot_response = format_response(response.text)

        
        ChatMessage.objects.create(user_input=user_input, bot_response=bot_response)

        return JsonResponse({'response': bot_response})

    return render(request, 'chatbot/chat.html')



def chat_history(request):
    """Retrieve and return the last 10 chat messages."""
    messages = ChatMessage.objects.order_by('-created_at')[:10]  # Fetch last 10 messages
    history = [{'user_input': msg.user_input, 'bot_response': msg.bot_response} for msg in messages]
    return JsonResponse({'history': history})
